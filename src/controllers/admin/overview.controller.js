// controllers/overview.controller.js
import {
  getStats
} from '../../services/admin/getOverviewData.service.js'
/**
 * @desc Render Overview Page
 * @route /admin/overview
 * @access Private ( Only Admin )
*/
export const renderOverview = async ( req, res, next ) => {
  try{
    // // Call Stats Servce
    const stats = await overviewService.getStats();

    // // Call Graph Data Serviicee
    // const profitsGraph = await getProfitsGraphService();

    // // Call Last Activities Service
    // const lastActivities = await getLastActivitiesService();
    
    // Render Page With Success Response
    res.status(200).render('admin/dashboard/overview', {
      sucess: true,
      data: {
        stats,
        // profitsGraph,
        // lastActivities
      }
    });
  }catch(err){
    console.log(err);
    next(err);
  };
};