///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 22:59:06
// Code is generated using templates: SD.TemplateBindings.SharedTemplates.NET20
// Templates vendor: Solutions Design.
// Templates version: 
//////////////////////////////////////////////////////////////
using System;
using System.Collections;
using System.Collections.Generic;
using policyDB;
using policyDB.FactoryClasses;
using policyDB.HelperClasses;
using SD.LLBLGen.Pro.ORMSupportClasses;

namespace policyDB.RelationClasses
{
	/// <summary>Implements the static Relations variant for the entity: Policy. </summary>
	public partial class PolicyRelations
	{
		/// <summary>CTor</summary>
		public PolicyRelations()
		{
		}

		/// <summary>Gets all relations of the PolicyEntity as a list of IEntityRelation objects.</summary>
		/// <returns>a list of IEntityRelation objects</returns>
		public virtual List<IEntityRelation> GetAllRelations()
		{
			List<IEntityRelation> toReturn = new List<IEntityRelation>();
			toReturn.Add(this.PolicyLinkEntityUsingPolicyId);
			toReturn.Add(this.RuleEntityUsingPolicyId);

			toReturn.Add(this.CombineModeEntityUsingCombineModeId);
			toReturn.Add(this.LibraryEntityUsingLibraryId);
			toReturn.Add(this.TargetEntityUsingTargetId);
			return toReturn;
		}

		#region Class Property Declarations

		/// <summary>Returns a new IEntityRelation object, between PolicyEntity and PolicyLinkEntity over the 1:n relation they have, using the relation between the fields:
		/// Policy.Id - PolicyLink.PolicyId
		/// </summary>
		public virtual IEntityRelation PolicyLinkEntityUsingPolicyId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany, "PolicyLink" , true);
				relation.AddEntityFieldPair(PolicyFields.Id, PolicyLinkFields.PolicyId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("PolicyEntity", true);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("PolicyLinkEntity", false);
				return relation;
			}
		}

		/// <summary>Returns a new IEntityRelation object, between PolicyEntity and RuleEntity over the 1:n relation they have, using the relation between the fields:
		/// Policy.Id - Rule.PolicyId
		/// </summary>
		public virtual IEntityRelation RuleEntityUsingPolicyId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany, "Rule" , true);
				relation.AddEntityFieldPair(PolicyFields.Id, RuleFields.PolicyId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("PolicyEntity", true);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("RuleEntity", false);
				return relation;
			}
		}


		/// <summary>Returns a new IEntityRelation object, between PolicyEntity and CombineModeEntity over the m:1 relation they have, using the relation between the fields:
		/// Policy.CombineModeId - CombineMode.Id
		/// </summary>
		public virtual IEntityRelation CombineModeEntityUsingCombineModeId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne, "CombineMode", false);
				relation.AddEntityFieldPair(CombineModeFields.Id, PolicyFields.CombineModeId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("CombineModeEntity", false);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("PolicyEntity", true);
				return relation;
			}
		}
		/// <summary>Returns a new IEntityRelation object, between PolicyEntity and LibraryEntity over the m:1 relation they have, using the relation between the fields:
		/// Policy.LibraryId - Library.Id
		/// </summary>
		public virtual IEntityRelation LibraryEntityUsingLibraryId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne, "Library", false);
				relation.AddEntityFieldPair(LibraryFields.Id, PolicyFields.LibraryId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("LibraryEntity", false);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("PolicyEntity", true);
				return relation;
			}
		}
		/// <summary>Returns a new IEntityRelation object, between PolicyEntity and TargetEntity over the m:1 relation they have, using the relation between the fields:
		/// Policy.TargetId - Target.Id
		/// </summary>
		public virtual IEntityRelation TargetEntityUsingTargetId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne, "Target", false);
				relation.AddEntityFieldPair(TargetFields.Id, PolicyFields.TargetId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("TargetEntity", false);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("PolicyEntity", true);
				return relation;
			}
		}

		/// <summary>stub, not used in this entity, only for TargetPerEntity entities.</summary>
		public virtual IEntityRelation GetSubTypeRelation(string subTypeEntityName) { return null; }
		/// <summary>stub, not used in this entity, only for TargetPerEntity entities.</summary>
		public virtual IEntityRelation GetSuperTypeRelation() { return null;}

		#endregion

		#region Included Code

		#endregion
	}
}
